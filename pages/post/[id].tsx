import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { DisplayPostData } from '../../@types/PostData';
import MyNavbar from '../../components/common/Navbar';

const Post = () => {
    const router = useRouter();
    const [postData, setPostData] = useState<DisplayPostData>(null);
    const { id } = router.query;

    useEffect(() => {
        const getPostData = async id => {
            const res = await fetch(`/api/post/${id}`);
            const postData: DisplayPostData = await res.json();
            setPostData(postData);
        };
        getPostData(id);
    }, [id]);

    return (
        <div>
            <Head>
                <title>fluid - {postData ? postData.title : ''}</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <MyNavbar></MyNavbar>
            <Container fluid>
                <Row>
                    <Col>
                        {(() => {
                            if (postData) {
                                const added_at = (new Date(postData.added_at)).toLocaleString();
                                return (
                                    <div>
                                        <Card className="text-center">
                                            <Card.Body>
                                                <Card.Title>{postData.title}</Card.Title>
                                                <Card.Subtitle>{postData.category}</Card.Subtitle>
                                                <Card.Link href={postData.url} target="_blank">{postData.url}</Card.Link>
                                                <Card.Text className="text-left">{postData.description}</Card.Text>
                                                <Card.Img src={postData.image} style={{ width: '18rem' }}></Card.Img>
                                                <Card.Text>{postData.tag.join(' / ')}</Card.Text>
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