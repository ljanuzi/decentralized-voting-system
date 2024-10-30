import React, { useState } from 'react';
import { Button, Form, Grid, Header, Segment, Container, Message, MessageHeader, Image } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import { AdminLoginApi } from '../../api/api';
import CryptoJS from 'crypto-js';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../../style/AdminLogin.css';
import '../../style/DarkTheme.css';

const AdminLogin = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [apiCall, setApiCall] = useState(false);
    const [errorState, setErrorState] = useState('');
    const { setAdmin } = useAuth();
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handlePrivateKeySubmit = async () => {
        setApiCall(true);
        setErrorState('');
        
        if (!selectedFile) {
            setErrorState('Please upload a .pem file');
            setApiCall(false);
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const fileContent = e.target.result;
            const encryptedFileContent = CryptoJS.AES.encrypt(fileContent, process.env.REACT_APP_SECRET_STRING).toString();

            const formData = new FormData();
            formData.append('file', new Blob([encryptedFileContent], { type: 'text/plain' }));

            try {
                const response = await AdminLoginApi(formData);
                const responseMessage = await response.json();
                setApiCall(false);

                if (!response.ok) {
                    setErrorState(responseMessage['message']);
                } else {
                    setAdmin({ 'admin_account': responseMessage['token'] });
                    navigate('/admin/registerCandidate');
                }
            } catch (err) {
                setApiCall(false);
                setErrorState('Something occurred please try again');
            }
        };
        reader.readAsText(selectedFile);
    };

    return (
        <Grid
            textAlign='center'
            style={{ height: '100vh' }}
            verticalAlign='middle'
            columns={2}
        >
            <Grid.Column textAlign='left' style={{ position: 'absolute', top: '10px', left: '10px', zIndex: '1000' }}>
                {/* Small square button with house icon to navigate back to landing page */}
                <Button icon size='large' style={{ width: '50px', height: '50px' }} onClick={() => navigate('/')}>
                    <i className='home icon'></i>
                </Button>
            </Grid.Column>

            <Grid.Column verticalAlign='middle' textAlign='center'>
                <Container text>
                    <Image src='/blockchainico.webp' className='logoImage' centered />
                    <Header as='h1' className='mainHeader'>
                        Decentralized Voting System powered by Blockchain
                    </Header>
                </Container>
            </Grid.Column>

            {/* Vertical Divider */}
            <div className="verticalDivider"></div>

            <Grid.Column verticalAlign='middle'>
                <Container>
                    <Grid textAlign='center'>
                        <Grid.Column style={{ maxWidth: 450 }}>
                            <>
                                <Header as='h2' className='subHeader' textAlign='center'>
                                    Upload your private key
                                </Header>
                                <Form size='large'>
                                    <Segment stacked className='formSegment'>
                                        <Form.Input
                                            fluid
                                            type='file'
                                            icon='file'
                                            iconPosition='left'
                                            placeholder='Private Key File'
                                            onChange={handleFileChange}
                                            className='publicKeyInput'
                                        />
                                        <Button loading={apiCall} fluid size='large' onClick={handlePrivateKeySubmit}>
                                            Submit
                                        </Button>
                                        {
                                            errorState.length !== 0 ?
                                                <Message negative>
                                                    <MessageHeader>Error</MessageHeader>
                                                    <p>{errorState}</p>
                                                </Message>
                                                : null
                                        }
                                    </Segment>
                                </Form>
                            </>
                        </Grid.Column>
                    </Grid>
                </Container>
            </Grid.Column>
        </Grid>
    );
};

export default AdminLogin;
