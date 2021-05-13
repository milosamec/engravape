import React, {useState, useEffect} from 'react'
import axios from 'axios'
import {PayPalButton} from 'react-paypal-button-v2'
import {Link} from 'react-router-dom'
import { Button, Row, Col, ListGroup, Image, Card } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { getOrderDetails, payOrder, deliverOrder } from '../actions/orderActions'
import { ORDER_PAY_RESET, ORDER_DELIVER_RESET } from '../constants/orderConstants'


const OrderScreen = ({ history, match }) => {

    // Grab order id from params
    const orderId = match.params.id

    // set PayPal SDK state
    const [sdkReady, setSdkReady] = useState(false)

    const dispatch = useDispatch()

    // Grab order details from state
    const orderDetails = useSelector(state => state.orderDetails)
    const {order, loading, error} = orderDetails

    // Grab orderPay info from state
    const orderPay = useSelector(state => state.orderPay)
    const {loading:loadingPay, success:successPay} = orderPay
    
    // Grab orderDeliver from state
    const orderDeliver = useSelector(state => state.orderDeliver)
    const {loading:loadingDeliver, success:successDeliver} = orderDeliver

    // Grab user info from state
    const userLogin = useSelector(state => state.userLogin)
    const {userInfo} = userLogin

    // If order details are back, calculate total with 2 decimals points .. 100.25
    if(!loading) {
        // Calculate Prices
        const addDecimals = (num) => {
            return (Math.round(num * 100) / 100).toFixed(2)
        }
        // Set order items price by multiplying item price * qty - for each item
        order.itemsPrice = addDecimals(order.orderItems.reduce((acc, item) => acc + item.price * item.qty, 0))
    }


    // If user not logged in - push to login
    useEffect(() => {

        if (!userInfo) {
            history.push("/login")
        }

        // PayPal script
        const addPaypalScript = async () => {
            const { data: clientId } = await axios.get('/api/config/paypal')
            const script = document.createElement('script')
            script.type = 'text/javascript'
            script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}`
            script.async = true
            script.onload = () => {
                // On screen load, set SDK ready to true
                setSdkReady(true)
            }
            // Append the script to the body
            document.body.appendChild(script)
        }

        // Check order state if order has changed and reset old state
        // Fetch new order details state
        if(!order || successPay || successDeliver) {
            dispatch({ type: ORDER_PAY_RESET })
            dispatch({ type: ORDER_DELIVER_RESET })
            dispatch(getOrderDetails(orderId))
         // Check if order is not paid and if tehre is not paypal script
            // And add the script to the window
        } else if (!order.isPaid) {
            if(!window.paypal) {
                addPaypalScript()
            } else {
                // Otherwise we set sdk State to true
                setSdkReady(true)
            }
        }

    }, [dispatch, orderId, successPay, successDeliver, order, history, userInfo])

    // Dispatch payOrder action that takes in the order id and paymentResult
    const successPaymentHandler = (paymentResult) => {
        dispatch(payOrder(orderId, paymentResult))
    }

    // Dispatch deliver order action when order is marked as delivered/shipped
    const deliverHandler = () => {
        dispatch(deliverOrder(order))
    }
    // if state is loading, show Loader else if anything else show error : otherwise show the order screen
    return loading ? <Loader /> : error ? <Message variant="danger">{error}</Message> : 
    
    <>
       <h1>Order {order._id}</h1> 
       <Row>
            <Col md={8}>
                <ListGroup variant="flush">
                    <ListGroup.Item>
                        <h2>Shipping</h2>
                        <p><strong>Name: </strong> {order.user.name}</p>
                        <p><strong>Email: </strong><a href={`mailto:${order.user.email}`}>{order.user.email}</a></p>
                        <p>
                            <strong>Address:</strong>
                            {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                        </p>
                        {order.isDelivered ? <Message variant='success'>Delivered on {order.DeliveredAt}</Message> : <Message variant="danger">Not Delivered</Message>}
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <h2>Payment Method</h2>
                        <p>
                        <strong>Method: </strong>
                        {order.paymentMethod}
                        </p>
                        {order.isPaid ? <Message variant='success'>Paid on {order.paidAt}</Message> : <Message variant="danger">Not Paid</Message>}
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <h2>Order Items</h2>
                        {order.orderItems.length === 0 ? <Message>Order is empty</Message> : (
                            <ListGroup variant="flush">
                                {order.orderItems.map((item, index) => (
                                    <ListGroup.Item key={index}>
                                        <Row>
                                            <Col md={1}>
                                                <Image src={item.image} alt={item.name} fluid rounded />
                                            </Col>
                                            <Col>
                                                <Link to={`/product/${item.product}`}>
                                                    {item.name}
                                                </Link>
                                            </Col>
                                            <Col md={4}>
                                                {item.qty} x ${item.price} = ${item.qty * item.price}
                                            </Col>
                                        </Row>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        )}
                    </ListGroup.Item>
                </ListGroup>
            </Col>
            <Col md={4}>
                <Card>
                    <ListGroup variant='flush'>
                        <ListGroup.Item>
                            <h2>Order Summary</h2>
                        </ListGroup.Item>

                        <ListGroup.Item>
                            <Row>
                                <Col>Items</Col>
                                <Col>${order.itemsPrice}</Col>
                            </Row>
                        </ListGroup.Item>

                        <ListGroup.Item>
                            <Row>
                                <Col>Shipping</Col>
                                <Col>${order.shippingPrice}</Col>
                            </Row>
                        </ListGroup.Item>

                        <ListGroup.Item>
                            <Row>
                                <Col>Tax</Col>
                                <Col>${order.taxPrice}</Col>
                            </Row>
                        </ListGroup.Item>

                        <ListGroup.Item>
                            <Row>
                                <Col>Total</Col>
                                <Col>${order.totalPrice}</Col>
                            </Row>
                        </ListGroup.Item>

                        {!order.isPaid && (
                            <ListGroup.Item>
                                {loadingPay && <Loader />}
                                {!sdkReady ? <Loader /> : (
                                    <PayPalButton amount={order.totalPrice} onSuccess={successPaymentHandler} />
                                )}
                            </ListGroup.Item>
                        )}

                        {loadingDeliver && <Loader />}
                        {userInfo.isAdmin && order.isPaid && !order.isDelivered && (
                            <ListGroup.Item>
                                <Button type="button" className="btn btn-block" onClick={deliverHandler}>Mark as delivered</Button>
                            </ListGroup.Item>
                        )}
                    </ListGroup>
                </Card>
            </Col>
        </Row>
    </>
}

export default OrderScreen
