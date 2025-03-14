import React, {useEffect} from 'react'
import { LinkContainer } from 'react-router-bootstrap'
import { Table, Button } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import Message from '../components/Message'
import Loader from '../components/Loader'
import { listAllOrders } from '../actions/orderActions'
  
const OrderListScreen = ({history}) => {
    const dispatch = useDispatch()

    // Grab all orders - must be admin
    const orderListAll = useSelector(state => state.orderListAll)
    const {loading:loadingOrders, error:errorOrders, orders} = orderListAll

    // Grab user from satte
    const userLogin = useSelector(state => state.userLogin)
    const {userInfo} = userLogin

  // Check if user is loged in and has an admin role
    // If yes, let him see all the store orders
    useEffect(() => {
        if(userInfo && userInfo.isAdmin) {
            dispatch(listAllOrders())
        } else {
          // Otherwise push him to login
            history.push('/login')
        }
        
    },[dispatch, history, userInfo])


    return (
        <>
        <h1>Orders</h1>
          {loadingOrders ? <Loader /> : errorOrders ? <Message variant="danger">{errorOrders}</Message> : (
              <Table striped bordered hover responsive className="table-sm">
                  <thead>
                      <tr>
                          <th>ID</th>
                          <th>USER</th>
                          <th>DATE</th>
                          <th>TOTAL</th>
                          <th>PAID</th>
                          <th>DELIVERED</th>
                      </tr>
                  </thead>
                  <tbody>
                      {orders.map(order => (
                          <tr key={order._id}>
                            <td>{order._id}</td>
                            <td>{order.user && order.user.name}</td>
                            <td>{order.createdAt.substring(0, 10)}</td>
                            <td>${order.totalPrice}</td>
                            <td>{order.isPaid ? (
                                order.paidAt.substring(0, 10)
                                ): (
                                    <i className="fas fa-times" style={{color: 'red'}}></i>
                                )}
                            </td>
                            <td>{order.isDelivered ? (
                                order.deliveredAt.substring(0, 10)
                                ): (
                                    <i className="fas fa-times" style={{color: 'red'}}></i>
                                )}
                            </td>
                            <td>
                                <LinkContainer to={`/order/${order._id}`}>
                                    <Button variant='light' className="btn-sm">Details</Button>
                                </LinkContainer>
                            </td>
                        </tr>
                      ))}
                  </tbody>
              </Table>
          )}  
        </>
    )
}

export default OrderListScreen
