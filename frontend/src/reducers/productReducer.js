import {
    PRODUCT_LIST_REQUEST,
    PRODUCT_LIST_SUCCESS,
    PRODUCT_LIST_FAIL
} from '../constants/productConstants'

export const productListReducer = (state = { product: [] }, action) => {
    switch(action.type) {
        case 'PRODUCT_LIST_REQUEST':
            return { loading: true, PRODUCTS: [] }
        case 'PRODUCT_LIST_SUCCESS':
            return { loading: false, products: action.payload }
        case 'PRODUCT_LIST_FAIL':
            return { loading: false, error: action.payload }
        default:
            return state
    }
}