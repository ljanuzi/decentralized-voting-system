import { Button, Grid, Header, Image } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import '../../style/landing.css';
import '../../style/DarkTheme.css';

const Landing = () => {
    return (
        <Grid
            textAlign='center'
            style={{ height: '100vh' }}
            verticalAlign='middle'
            columns={2}
        >
            {/* Left column for buttons */}
            <Grid.Column verticalAlign='middle' textAlign='center'>
                <Image src='/blockchainico.webp' className='customImage' centered />
                <Header as="h1" className='mainHeader'>
                    Decentralized Voting System powered by Blockchain
                </Header>
            </Grid.Column>

            {/* Vertical Divider */}
            <div className="verticalDivider"></div>

            {/* Right column for image and text */}
            <Grid.Column verticalAlign='middle'>
                <Header as='h2' textAlign='center' className='subHeader'>
                    Get started on the voting
                </Header>
                <Button size='huge' href='/login'>
                    Log in as a User
                </Button>
                <Header as='h2' textAlign='center' className='subHeader'>
                    Voting System Administrator Portal
                </Header>
                <Button size='huge' href='/admin/login'>
                    Log in as Admin
                </Button>
            </Grid.Column>
        </Grid>
    );
};

export default Landing;
