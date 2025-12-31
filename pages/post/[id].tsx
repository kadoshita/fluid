import React from 'react';
import Head from 'next/head';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { DisplayPostData } from '../../@types/PostData';
import MyNavbar from '../../components/common/Navbar';
import Link from 'next/link';
import Header from '../../components/common/Header';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { PostService } from '../../lib/services';

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
    const id = params.id;
    if (!id || typeof id !== 'string') {
        return {
            notFound: true
        };
    }
    const postData: DisplayPostData = await PostService.getPostById(id);

    if (!postData) {
        return {
            notFound: true
        };
    }

    return {
        props: { postData, id }
    }
};

const Post = ({ postData, id }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    return (
        <div>
            <Head>
                <title>fluid - {postData ? postData.title : ''}</title>
                <link rel="icon" href="/favicon.ico" />
                <Header title={`fluid - ${postData ? postData.title : ''}`}
                    url={`https://fluid.sublimer.me/post/${id}`}
                    description='An application for Web clipping and sharing.'
                    image={postData.image ? postData.image : 'https://fluid.sublimer.me/logo.png'}
                    type='article'
                    keywords='RSS,Portal,News,Technology'></Header>
            </Head>
            <MyNavbar></MyNavbar>
            <Container fluid>
                <Row>
                    <Col>
                        {(() => {
                            if (postData) {
                                const added_at = (new Date(postData.added_at)).toLocaleString('ja-JP');
                                return (
                                    <div>
                                        <Card className="text-center">
                                            <Card.Body>
                                                <Card.Title>{postData.title}</Card.Title>
                                                <Card.Subtitle><Link href={`/category/${postData.category}`}>{postData.category}</Link></Card.Subtitle>
                                                <Card.Link href={postData.url} target="_blank">{postData.url}</Card.Link>
                                                <Card.Text className="text-left">{postData.description}</Card.Text>
                                                <Card.Text className="text-left">{postData.comment}</Card.Text>
                                                <Card.Img src={postData.image} style={{ width: '18rem' }}></Card.Img>
                                                <Card.Text>{postData.tag.map((t, i) => <Link key={i} href={`/tag/${t}`} style={{ marginRight: '8px' }}>{t}</Link>)}</Card.Text>
                                            </Card.Body>
                                            <Card.Footer className="text-muted">Added at: {added_at}</Card.Footer>
                                        </Card>
                                    </div>
                                );
                            } else {
                                return (
                                    <div>
                                        <p>Loading...</p>
                                    </div>
                                )
                            }
                        })()}
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default Post;
