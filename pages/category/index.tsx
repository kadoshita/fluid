import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Container, Row, Col } from 'react-bootstrap';
import MyNavbar from '../../components/common/Navbar';
import Header from '../../components/common/Header';

const Category = () => {
    const [categories, setCategories] = useState<string[]>([]);

    useEffect(() => {
        const getCategories = async () => {
            const res = await fetch(`/api/category`);
            const categoriesJson: string[] = await res.json();
            setCategories(categoriesJson);
        };
        getCategories();
    }, []);

    return (
        <div>
            <Head>
                <title>fluid - Category</title>
                <link rel="icon" href="/favicon.ico" />
                <Header title={`fluid - Category`}
                    url={`https://fluid-portal.azurewebsites.net/category`}
                    description='An application for Web clipping and sharing.'
                    image='https://fluid-portal.azurewebsites.net/logo.png'
                    type='article'
                    keywords='RSS,Portal,News,Technology'></Header>
            </Head>
            <MyNavbar></MyNavbar>
            <Container fluid>
                <Row>
                    <Col>
                        <ul>
                            {categories.map((c, i) => <li key={i}><Link href={`/category/${c}`}><a>{c}</a></Link></li>)}
                        </ul>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default Category;