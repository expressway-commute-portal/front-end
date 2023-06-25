import {FacebookFilled, GithubFilled, TeamOutlined} from '@ant-design/icons';
import {Button, Divider, Layout, Space, Typography} from 'antd';
import packageJson from '../../../package.json';
import {DateTime} from 'luxon';

const {Footer: AntFooter} = Layout;

const Footer = () => {
  return (
    <AntFooter style={{textAlign: 'center'}}>
      <Space direction={'horizontal'}>
        <Button
          type="primary"
          shape="circle"
          icon={<FacebookFilled />}
          size={'large'}
          href={'https://www.facebook.com/expresswaycommuteportal'}
          target={'_blank'}
        />
        <Button
          type="primary"
          shape="circle"
          icon={<GithubFilled />}
          size={'large'}
          href={'https://github.com/expressway-commute-portal'}
          target={'_blank'}
        />
        <Button
          type="primary"
          shape="circle"
          icon={<TeamOutlined />}
          size={'large'}
          href={'https://www.facebook.com/groups/Highway.Bus.Sri.Lanka'}
          target={'_blank'}
        />
      </Space>
      <Divider />
      <div>
        <Typography.Text type={'secondary'} italic>
          Copyright © {DateTime.now().year} by Expressway Commute Portal(ECP)
          <br />
          <a
            href="https://www.flaticon.com/free-icons/highway"
            title="highway icons"
            target={'_blank'}
            rel="noreferrer">
            Highway icons created by Bartama Graphic - Flaticon
          </a>
        </Typography.Text>
      </div>
      <div>
        <Typography.Text type={'secondary'} italic>
          v{packageJson.version}
        </Typography.Text>
      </div>
    </AntFooter>
  );
};

export default Footer;
