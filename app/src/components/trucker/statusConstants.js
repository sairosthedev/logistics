export const BidStatus = {
    ACCEPTED: 'accepted',
    LOADED: 'loaded',
    IN_TRANSIT: 'in_transit',
    DELIVERED: 'delivered',
    COMPLETED: 'completed'
};

export const STATUS_CONFIG = {
    [BidStatus.ACCEPTED]: {
        label: 'Accepted',
        color: 'bg-blue-100 text-blue-800',
        nextStatus: BidStatus.LOADED
    },
    [BidStatus.LOADED]: {
        label: 'Loaded',
        color: 'bg-yellow-100 text-yellow-800',
        nextStatus: BidStatus.IN_TRANSIT
    },
    [BidStatus.IN_TRANSIT]: {
        label: 'In Transit',
        color: 'bg-orange-100 text-orange-800',
        nextStatus: BidStatus.DELIVERED
    },
    [BidStatus.DELIVERED]: {
        label: 'Delivered',
        color: 'bg-green-100 text-green-800',
        nextStatus: BidStatus.COMPLETED
    },
    [BidStatus.COMPLETED]: {
        label: 'Completed',
        color: 'bg-gray-100 text-gray-800',
        nextStatus: null
    }
};