import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import Head from 'next/head';
import 'bootstrap/dist/css/bootstrap.min.css';
import MyNavbar from '../../components/common/Navbar';
import { ListTable } from '../../components/list';
import { DisplayPostData } from '../../@types/PostData';
import Header from '../../components/common/Header';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
    const { tag } = query;
    const res = await fetch(`${process.env.HOST}/api/tag/${encodeURIComponent(tag as string)}`);
    const tagPostData: DisplayPostData[] = await res.json();

    return {
        props: { tag, tagPostData }
    }
};

const Tag = ({ tag, tagPostData }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    return (
        <div>
            <Head>
                <title>fluid - {tag}</title>
                <link rel="icon" href="/favicon.ico" />
                <Header title={`fluid - ${tag}`}
                    url={`https://fluid.sublimer.me/tag/${tag}`}
                    description='An application for Web clipping and sharing.'
                    image='https://fluid.sublimer.me/logo.png'
                    type='article'
                    keywords='RSS,Portal,News,Technology'></Header>
            </Head>
            <MyNavbar></MyNavbar>
            <Container fluid>
                <Row>
                    <Col>
                        <ListTable data={tagPostData}></ListTable>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}
export default Tag;