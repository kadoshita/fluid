import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Container, Row, Col } from 'react-bootstrap';
import MyNavbar from '../../components/common/Navbar';
import Header from '../../components/common/Header';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { TagService } from '../../lib/services';

export const getServerSideProps: GetServerSideProps = async () => {
    const tags: string[] = await TagService.getAllTags();
    return {
        props: {
            tags
        }
    }
};

const Tag = ({ tags }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    return (
        <div>
            <Head>
                <title>fluid - Tag</title>
                <link rel="icon" href="/favicon.ico" />
                <Header title={`fluid - Tag`}
                    url={`https://fluid.sublimer.me/tag`}
                    description='An application for Web clipping and sharing.'
                    image='https://fluid.sublimer.me/logo.png'
                    type='article'
                    keywords='RSS,Portal,News,Technology'></Header>
            </Head>
            <MyNavbar></MyNavbar>
            <Container fluid>
                <Row>
                    <Col>
                        <ul>
                            {tags.map((t, i) => <li key={i}><Link href={`/tag/${t}`}>{t}</Link></li>)}
                        </ul>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default Tag;