import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Container, Row, Col } from 'react-bootstrap';
import MyNavbar from '../../components/common/Navbar';
import Header from '../../components/common/Header';

const Tag = () => {
    const [tags, setTags] = useState<string[]>([]);

    useEffect(() => {
        const getTags = async () => {
            const res = await fetch(`/api/tag`);
            const tagsJson: string[] = await res.json();
            setTags(tagsJson);
        };
        getTags();
    }, []);

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
                            {tags.map((t, i) => <li key={i}><Link href={`/tag/${t}`}><a>{t}</a></Link></li>)}
                        </ul>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default Tag;