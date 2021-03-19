import React from 'react'
import { Helmet } from 'react-helmet'

const Meta = ({title, description, keywords}) => {
    return (
        <Helmet>
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="keyword" content={keywords} />
        </Helmet>
    )
}

Meta.defaultProps = {
    title: 'Welcome To ProShop',
    description: "We sell the best Juul Vaporizer Shells for your device!",
    keywords: "juul, juul vaporizer, juul shell, juul engraving, custom juul engraving"
}

export default Meta
