import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import Head from 'next/head';
import absoluteUrl from 'next-absolute-url';
import 'bootstrap/dist/css/bootstrap.min.css';
import MyNavbar from '../../components/common/Navbar';
import { ListTable } from '../../components/list';
import { DisplayPostData } from '../../@types/PostData';
import Header from '../../components/common/Header';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';

export const getServerSideProps: GetServerSideProps = async ({ query, req }) => {
    const { protocol, host } = absoluteUrl(req, 'localhost:3000');
    const apiBaseURL = `${protocol}//${host}`;
    const { category } = query;
    const res = await fetch(`${apiBaseURL}/api/category/${category}`);
    const categoryPostData: DisplayPostData[] = await res.json();

    return {
        props: { categoryPostData, category }
    };
};

const Category = ({ categoryPostData, category }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    return (
        <div>
            <Head>
                <title>fluid - {category}</title>
                <link rel="icon" href="/favicon.ico" />
                <Header title={`fluid - ${category}`}
                    url={`https://fluid.sublimer.me/category/${category}`}
                    description='An application for Web clipping and sharing.'
                    image='https://fluid.sublimer.me/logo.png'
                    type='article'
                    keywords='RSS,Portal,News,Technology'></Header>
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