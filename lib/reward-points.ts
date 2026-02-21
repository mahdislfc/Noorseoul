const DELIVERED_STATUS = "Delivered"

export const SPENT_POINTS_KEY = "reward_spent_points"
export const CLAIMED_REWARDS_KEY = "reward_claimed_rewards"
export const FREE_SHIPPING_CLAIMED_KEY = "reward_free_shipping_claimed"
export const VOUCHER_15_CLAIMED_KEY = "reward_voucher_15_claimed"
export const VOUCHER_30_CLAIMED_KEY = "reward_voucher_30_claimed"
export const CHOOSE_PRODUCT_SELECTED_KEY = "reward_choose_product_selected"
export const TEST_BONUS_POINTS = 0
const POINTS_CACHE_RESET_KEY = "reward_points_cache_reset_v2"
const POINTS_CACHE_BASE_KEYS = [
    SPENT_POINTS_KEY,
    CLAIMED_REWARDS_KEY,
    FREE_SHIPPING_CLAIMED_KEY,
    VOUCHER_15_CLAIMED_KEY,
    VOUCHER_30_CLAIMED_KEY,
    CHOOSE_PRODUCT_SELECTED_KEY,
]

export const REWARD_COST: Record<string, number> = {
    "choose-product": 75,
    shipping: 100,
    voucher15: 150,
    voucher30: 300,
}

export interface RewardOrderLike {
    status: string
    total: number
}

export const pointsFromOrderTotal = (amount: number) => {
    if (amount <= 0) return 0
    if (amount <= 10) return 1
    if (amount <= 19) return 2
    return Math.floor(amount / 10) + 1
}

export const calculateEarnedPoints = (orders: RewardOrderLike[]) => {
    const completedOrders = orders.filter((order) => order.status === DELIVERED_STATUS)
    return completedOrders.reduce((sum, order) => sum + pointsFromOrderTotal(order.total), 0)
}

export const calculateAvailablePoints = (
    earnedPoints: number,
    spentPoints: number,
    bonusPoints = TEST_BONUS_POINTS
) => Math.max(0, earnedPoints + bonusPoints - spentPoints)

export const getRewardStorageKey = (baseKey: string, userEmail?: string | null) => {
    const userKey = userEmail?.toLowerCase() || "guest"
    return `${baseKey}:${userKey}`
}

export const clearRewardPointsCacheOnce = () => {
    if (typeof window === "undefined") return

    try {
        if (localStorage.getItem(POINTS_CACHE_RESET_KEY) === "1") return

        const keys = Object.keys(localStorage)
        for (const key of keys) {
            const shouldClear = POINTS_CACHE_BASE_KEYS.some(
                (baseKey) => key === baseKey || key.startsWith(`${baseKey}:`)
            )
            if (shouldClear) {
                localStorage.removeItem(key)
            }
        }

        localStorage.setItem(POINTS_CACHE_RESET_KEY, "1")
    } catch {
        // ignore storage issues
    }
}

interface ReadStoredSpentPointsOptions {
    reconcile?: boolean
}

export const readStoredSpentPoints = (
    userEmail?: string | null,
    options: ReadStoredSpentPointsOptions = {}
) => {
    if (typeof window === "undefined") return 0
    const shouldReconcile = options.reconcile ?? true

    try {
        let nextSpentPoints = Number(localStorage.getItem(getRewardStorageKey(SPENT_POINTS_KEY, userEmail)) || "0")
        if (!Number.isFinite(nextSpentPoints)) nextSpentPoints = 0
        nextSpentPoints = Math.max(0, nextSpentPoints)

        const claimedRaw = localStorage.getItem(getRewardStorageKey(CLAIMED_REWARDS_KEY, userEmail))
        let claimedMap: Record<string, boolean> = {}

        if (claimedRaw) {
            claimedMap = JSON.parse(claimedRaw) as Record<string, boolean>
        }

        if (localStorage.getItem(getRewardStorageKey(FREE_SHIPPING_CLAIMED_KEY, userEmail)) === "true") claimedMap.shipping = true
        if (localStorage.getItem(getRewardStorageKey(VOUCHER_15_CLAIMED_KEY, userEmail)) === "true") claimedMap.voucher15 = true
        if (localStorage.getItem(getRewardStorageKey(VOUCHER_30_CLAIMED_KEY, userEmail)) === "true") claimedMap.voucher30 = true
        if (localStorage.getItem(getRewardStorageKey(CHOOSE_PRODUCT_SELECTED_KEY, userEmail))) claimedMap["choose-product"] = true

        const minimumSpentFromClaims = Object.entries(claimedMap).reduce((sum, [rewardId, isClaimed]) => {
            if (!isClaimed) return sum
            return sum + (REWARD_COST[rewardId] || 0)
        }, 0)

        const didAdjustSpentPoints = nextSpentPoints < minimumSpentFromClaims
        nextSpentPoints = Math.max(nextSpentPoints, minimumSpentFromClaims)

        if (shouldReconcile && didAdjustSpentPoints) {
            localStorage.setItem(getRewardStorageKey(SPENT_POINTS_KEY, userEmail), String(nextSpentPoints))
            localStorage.setItem(getRewardStorageKey(CLAIMED_REWARDS_KEY, userEmail), JSON.stringify(claimedMap))
        }

        return nextSpentPoints
    } catch {
        return 0
    }
}
