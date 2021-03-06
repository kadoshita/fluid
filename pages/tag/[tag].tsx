import React, { useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import Head from 'next/head';
import 'bootstrap/dist/css/bootstrap.min.css';
import MyNavbar from '../../components/common/Navbar';
import { ListTable } from '../../components/list';
import { DisplayPostData } from '../../@types/PostData';
import { useRouter } from 'next/router';

const Tag = () => {
    const router = useRouter();
    const [tagPostData, setTagPostData] = useState<DisplayPostData[]>([]);
    const { tag } = router.query;

    useEffect(() => {
        const gettagPostData = async tag => {
            const res = await fetch(`/api/tag/${tag}`);
            const data: DisplayPostData[] = await res.json();
            setTagPostData(data);
        };
        gettagPostData(tag);
    }, [tag]);
    return (
        <div>
            <Head>
                <title>fluid - {tag}</title>
                <link rel="icon" href="/favicon.ico" />
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