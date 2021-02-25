import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { PostData } from '../../@types/PostData';
import MyNavbar from '../../components/common/Navbar';

const Post = () => {
    const router = useRouter();
    const [postData, setPostData] = useState<PostData>(null);
    const { id } = router.query;

    useEffect(() => {
        const getPostData = async id => {
            const res = await fetch(`/api/post/${id}`);
            const postData: PostData = await res.json();
            setPostData(postData);
        };
        getPostData(id);
    }, [id]);

    return (
        <div>
            <MyNavbar></MyNavbar>
            <Container fluid>
                <Row>
                    <Col>
                        {(() => {
                            if (postData) {
                                return (
                                    <div>
                                        <Card className="text-center">
                                            <Card.Body>
                                                <Card.Title>{postData.title}</Card.Title>
                                                <Card.Text><a href={postData.url} target="_blank">{postData.url}</a></Card.Text>
                                            </Card.Body>
                                            <Card.Footer className="text-muted">Added at: {postData.added_at}</Card.Footer>
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