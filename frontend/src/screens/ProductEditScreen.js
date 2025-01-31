import axios from 'axios'
import React, {useState, useEffect} from 'react'
import { Link } from 'react-router-dom'
import { Form, Button} from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import Message from '../components/Message'
import Loader from '../components/Loader'
import FormContainer from '../components/FormContainer'
import { listProductDetails, updateProduct } from '../actions/productActions'
import {PRODUCT_DETAILS_RESET, PRODUCT_UPDATE_RESET} from '../constants/productConstants'

const ProductEditScreen = ({ match, history }) => {
    // Set State for each label on product edit screen
    const productId = match.params.id
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [price, setPrice] = useState(0)
    const [image, setImage] = useState("")
    const [brand, setBrand] = useState("")
    const [category, setCategory] = useState("")
    const [countInStock, setCountInStock] = useState(0)
    const [description, setDescription] = useState("")
    const [uploading, setUploading] = useState(false)


    const dispatch = useDispatch()

    // Grab product Details state
    const productDetails = useSelector(state => state.productDetails)
    const {loading, error, product} = productDetails

    // Grab product Update state
    const productUpdate = useSelector(state => state.productUpdate)
    const {loading:loadingUpdate, error:errorUpdate, success:successUpdate} = productUpdate

    useEffect(() => {
        // If product has been successfully updated, we want to reset the edit state
        // And push user to product List screen
        if(successUpdate) {
            dispatch({type: PRODUCT_UPDATE_RESET})
            dispatch({type: PRODUCT_DETAILS_RESET})
            history.push('/admin/productlist')
        } else {
            // If we're missing products name or product id does not match product id in params
            if(!product.name || product._id !== productId) {
                // we dispatch an action to grab the product details
                dispatch(listProductDetails(productId))
            } else {
                // Otherwise we set the product edit local state to product info that was fetched from mongo
                setName(product.name)
                setPrice(product.price)
                setImage(product.image)
                setBrand(product.brand)
                setCategory(product.category)
                setCountInStock(product.countInStock)
                setDescription(product.description)
            }   
        }
            // run useEffect if any of the below changes/updates
        }, [dispatch, history, productId, product, successUpdate])

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0]
        const formData = new FormData()
        formData.append('image', file)
        setUploading(true)

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }

            const { data } = await axios.post('/api/upload', formData, config)

            setImage(data)
            setUploading(false)
        } catch (error) {
            console.error(error)
            setUploading(false)
        }
    } 

    // on Update - we want to dispatch the updateProduct action with local state and the product id from params
    const submitHandler = (e) => {
        e.preventDefault()
        dispatch(updateProduct({
            _id: productId,
            name,
            price,
            image,
            brand,
            category,
            description,
            countInStock
        }))
    }


    return (
        <>
            <Link to='/admin/productList' className="btn btn-light my-3">Go Back</Link>
            <FormContainer>
                <h1>Edit Product</h1>
                {loadingUpdate && <Loader />}
                {errorUpdate && <Message variant='danger'>{errorUpdate}</Message>}
                {loading ? ( <Loader /> ) : error ? ( <Message variant="danger">{error}</Message> ) : (
                <Form onSubmit={submitHandler}>
                    <Form.Group controlId="name">
                        <Form.Label>Name</Form.Label>
                        <Form.Control type="name" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)}></Form.Control>
                    </Form.Group>

                    <Form.Group controlId="email">
                        <Form.Label>Price</Form.Label>
                        <Form.Control type="price" placeholder="Enter price" value={price} onChange={(e) => setPrice(e.target.value)}></Form.Control>
                    </Form.Group>

                    <Form.Group controlId="image">
                        <Form.Label>Image</Form.Label>
                        <Form.Control type="text" placeholder="Enter image url" value={image} onChange={(e) => setImage(e.target.value)}></Form.Control>
                        <Form.File id="image-file" label="Choose file" custom onChange={uploadFileHandler}></Form.File>
                        {uploading && <Loader />}
                    </Form.Group>

                    <Form.Group controlId="brand">
                        <Form.Label>Brand</Form.Label>
                        <Form.Control type="brand" placeholder="Enter brand name" value={brand} onChange={(e) => setBrand(e.target.value)}></Form.Control>
                    </Form.Group>

                    <Form.Group controlId="countInStock">
                        <Form.Label>Count In Stock</Form.Label>
                        <Form.Control type="number" placeholder="Enter countInStock" value={countInStock} onChange={(e) => setCountInStock(e.target.value)}></Form.Control>
                    </Form.Group>

                    <Form.Group controlId="category">
                        <Form.Label>Category</Form.Label>
                        <Form.Control type="text" placeholder="Enter Category" value={category} onChange={(e) => setCategory(e.target.value)}></Form.Control>
                    </Form.Group>

                    
                    <Form.Group controlId="description">
                        <Form.Label>Description</Form.Label>
                        <Form.Control type="text" placeholder="Enter Description" value={description} onChange={(e) => setDescription(e.target.value)}></Form.Control>
                    </Form.Group>

                    <Button type='submit' variant='primary' onClick={submitHandler}>Update</Button>
                </Form>
                )}
            </FormContainer>
        </>
    )
}


export default ProductEditScreen
