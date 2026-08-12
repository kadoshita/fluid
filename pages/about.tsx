import Head from 'next/head';
import { Col, Container, Row } from 'react-bootstrap';
import Header from '../components/common/Header';
import MyNavbar from '../components/common/Navbar';

const About = () => {
  return (
    <div>
      <Head>
        <title>fluid - About</title>
        <link rel='icon' href='/favicon.ico' />
        <Header
          title={`fluid - About`}
          url={`https://fluid.sublimer.me/about`}
          description='An application for Web clipping and sharing.'
          image='https://fluid.sublimer.me/logo.png'
          type='article'
          keywords='RSS,Portal,News,Technology'
        ></Header>
      </Head>
      <MyNavbar></MyNavbar>
      <Container fluid>
        <Row>
          <Col>
            <h1>About fluid</h1>
            <p>fluid は、記事やニュースをクリップ・共有するためのアプリケーションです。</p>
            <p>
              投稿された記事は一覧で閲覧できるほか、カテゴリやタグごとに絞り込んで探すこともできます。また、キーワードによる検索や、更新情報を受け取れるRSS配信にも対応しています。
            </p>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default About;
