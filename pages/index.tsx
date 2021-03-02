import React, { useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import Head from 'next/head';
import 'bootstrap/dist/css/bootstrap.min.css';
import MyNavbar from '../components/common/Navbar';
import { ListTable } from '../components/list';
import { DisplayPostData } from '../@types/PostData';

const Home = () => {
  const [postData, setPostData] = useState<DisplayPostData[]>([]);

  useEffect(() => {
    const getPostData = async () => {
      const res = await fetch('/api/post');
      const data: DisplayPostData[] = await res.json();
      setPostData(data);
    };
    getPostData();
  }, []);
  return (
    <div>
      <Head>
        <title>fluid - Home</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MyNavbar></MyNavbar>
      <Container fluid>
        <Row>
          <Col>
            <ListTable data={postData}></ListTable>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
export default Home;