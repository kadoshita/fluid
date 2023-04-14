import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import absoluteUrl from 'next-absolute-url';
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { DisplayPostData } from '../@types/PostData';
import Header from '../components/common/Header';
import MyNavbar from '../components/common/Navbar';
import { ListTable } from '../components/list';
import { useRouter } from 'next/router';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    const { protocol, host } = absoluteUrl(req, 'localhost:3000');
    const apiBaseURL = `${protocol}//${host}`;
    const res = await fetch(`${apiBaseURL}/api/category`);
    const categories: string[] = await res.json();

    return {
        props: { categories },
    };
};

const Search = ({ categories }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    const router = useRouter();
    const {
        keyword: queryKeyword,
        category: queryCategory,
        url: queryUrl,
    } = router.query as { keyword: string; category: string; url: string };
    const [postData, setPostData] = useState<DisplayPostData[]>([]);
    const [keyword, setKeyword] = useState<string>(queryKeyword || '');
    const [url, setUrl] = useState<string>(queryUrl || '');
    const [category, setCategory] = useState<string>(queryCategory || '');

    const fetchSearchResult = async (keyword, category, url) => {
        const query = new URLSearchParams({ keyword, category, url });
        router.replace(`/search?${query}`);
        const res = await fetch(`/api/search?${query}`);
        const data: DisplayPostData[] = await res.json();
        setPostData(data);
    };

    const handleSubmit = async () => {
        await fetchSearchResult(keyword, category, url);
    };

    useEffect(() => {
        if (queryKeyword === undefined && queryCategory === undefined && queryUrl === undefined) return;

        if (queryKeyword !== '' || queryCategory !== '' || queryUrl !== '') {
            fetchSearchResult(queryKeyword, queryCategory, queryUrl);
        }
    }, []);

    return (
        <div>
            <Head>
                <title>fluid - Home</title>
                <link rel="icon" href="/favicon.ico" />
                <Header
                    title="fluid"
                    url="https://fluid.sublimer.me"
                    description="An application for Web clipping and sharing."
                    image="https://fluid.sublimer.me/logo.png"
                    type="website"
                    keywords="RSS,Portal,News,Technology"
                ></Header>
            </Head>
            <MyNavbar></MyNavbar>
            <Container fluid>
                <Row>
                    <Col>
                        <Form.Label>Keyword</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Keyword"
                            onChange={({ target }) => setKeyword(target.value)}
                        />
                        <Form.Label>URL</Form.Label>
                        <Form.Control type="text" placeholder="URL" onChange={({ target }) => setUrl(target.value)} />
                        <Form.Label>Category</Form.Label>
                        <Form.Control as="select" onChange={({ target }) => setCategory(target.value)}>
                            {[''].concat(categories).map((c, i) => (
                                <option key={i} value={c}>
                                    {c}
                                </option>
                            ))}
                        </Form.Control>
                        <Button variant="primary" type="button" onClick={handleSubmit}>
                            Submit
                        </Button>
                        <ListTable data={postData}></ListTable>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Search;
