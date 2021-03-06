import React from 'react';

type HeaderProps = {
    title: string;
    description: string;
    keywords: string;
    url: string;
    image: string;
    type: string;
}
const Header = (props: HeaderProps) => {

    return (
        <>
            <meta property="og:title" content={props.title} />
            <meta property="og:description" content={props.description} />
            <meta name="keywords" content={props.keywords} />
            <meta property="og:type" content={props.type} />
            <meta property="og:url" content={props.url} />
            <meta property="og:image" content={props.image} />
            <meta property="og:site_name" content={props.title} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content="@lz650sss" />
            <meta name="twitter:url" content={props.image} />
            <meta name="twitter:title" content={props.title} />
            <meta name="twitter:description" content={props.description} />
            <meta name="twitter:image" content={props.image} />
            <link rel="canonical" href={props.url} />
        </>
    )
};

export default Header;