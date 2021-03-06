import React, { useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import Head from 'next/head';
import 'bootstrap/dist/css/bootstrap.min.css';
import MyNavbar from '../../components/common/Navbar';
import { ListTable } from '../../components/list';
import { DisplayPostData } from '../../@types/PostData';
import { useRouter } from 'next/router';

const Category = () => {
    const router = useRouter();
    const [categoryPostData, setCategoryPostData] = useState<DisplayPostData[]>([]);
    const { category } = router.query;

    useEffect(() => {
        const getCategoryPostData = async category => {
            const res = await fetch(`/api/category/${category}`);
            const data: DisplayPostData[] = await res.json();
            setCategoryPostData(data);
        };
        getCategoryPostData(category);
    }, [category]);
    return (
        <div>
            <Head>
                <title>fluid - {category}</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <MyNavbar></MyNavbar>
            <Container fluid>
                <Row>
                    <Col>
                        <ListTable data={categoryPostData}></ListTable>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}
export default Category;