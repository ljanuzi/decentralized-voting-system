import React, { useState } from 'react';
import { Button, Form, Grid, Header, Segment, Container, Message, MessageHeader, Image } from 'semantic-ui-react';
import { LoginApi, OtpApi } from '../../api/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../../style/Login.css';
import '../../style/DarkTheme.css';
import { Link } from 'react-router-dom';

const Login = () => {
    const [step, setStep] = useState('publicKey');
    const [publicKey, setPublicKey] = useState('');
    const [otp, setOtp] = useState('');
    const [apiCall, setApiCall] = useState(false);
    const [errorState, setErrorState] = useState('');
    const { user, setUser, admin, setAdmin } = useAuth();
    const navigate = useNavigate();

    const handlePublicKeySubmit = async () => {
        setApiCall(true);
        setErrorState('');
        try {
            const request = {
                "public_key": publicKey
            }
            const response = await LoginApi(request);
            const responseMessage = await response.json();
            setApiCall(false);
            if (!response.ok) {
                setErrorState(responseMessage['message']);
            } else {
                setStep('otp');
            }
        } catch (err) {
            setApiCall(false);
            setErrorState('Something occurred please try again');
        }
    };

    const handleOtpSubmit = async () => {
        setApiCall(true);
        setErrorState('');
        try {
            const request = {
                "public_key": publicKey,
                "otp": parseInt(otp)
            }
            const response = await OtpApi(request);
            const responseMessage = await response.json();
            setApiCall(false);
            if (!response.ok) {
                setErrorState(responseMessage['message']);
            } else {
                setUser({ 'user_account': responseMessage['token'] });
                navigate('/chooseCandidate');
            }
        } catch (err) {
            setApiCall(false);
            setErrorState('Something occurred please try again');
        }
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
                            {step === 'publicKey' && (
                                <>
                                    <Header as='h2' className='subHeader' textAlign='center'>
                                        Please, provide your public key
                                    </Header>
                                    <Form size='large'>
                                        <Segment stacked className='customInput'>
                                            <Form.Input
                                                fluid
                                                icon='key'
                                                iconPosition='left'
                                                placeholder='Public Key'
                                                value={publicKey}
                                                onChange={(e) => setPublicKey(e.target.value)}
                                                className='publicKeyInput'
                                            />
                                            <Button loading={apiCall} fluid size='large' onClick={handlePublicKeySubmit}>
                                                Submit
                                            </Button>
                                        </Segment>
                                    </Form>
                                    <Message>
                                        Not a registered voter? <Link to='/register'>Register</Link>
                                    </Message>
                                    {errorState.length !== 0 && (
                                        <Message negative>
                                            <MessageHeader>Error</MessageHeader>
                                            <p>{errorState}</p>
                                        </Message>
                                    )}
                                </>
                            )}
                            {step === 'otp' && (
                                <>
                                    <Header as='h2' className='tealHeader' textAlign='center'>
                                        Enter your OTP
                                    </Header>
                                    <Form size='large'>
                                        <Segment stacked className='formSegment'>
                                            <Form.Group widths='equal'>
                                                <Form.Input
                                                    fluid
                                                    placeholder='_'
                                                    value={otp[0] || ''}
                                                    onChange={(e) => setOtp(otp.slice(0, 0) + e.target.value + otp.slice(2))}
                                                    maxLength={1}
                                                />
                                                <Form.Input
                                                    fluid
                                                    placeholder='_'
                                                    value={otp[1] || ''}
                                                    onChange={(e) => setOtp(otp.slice(0, 1) + e.target.value + otp.slice(2))}
                                                    maxLength={1}
                                                />
                                                <Form.Input
                                                    fluid
                                                    placeholder='_'
                                                    value={otp[2] || ''}
                                                    onChange={(e) => setOtp(otp.slice(0, 2) + e.target.value + otp.slice(3))}
                                                    maxLength={1}
                                                />
                                                <Form.Input
                                                    fluid
                                                    placeholder='_'
                                                    value={otp[3] || ''}
                                                    onChange={(e) => setOtp(otp.slice(0, 3) + e.target.value)}
                                                    maxLength={1}
                                                />
                                            </Form.Group>
                                            <Button loading={apiCall} fluid size='large' onClick={handleOtpSubmit}>
                                                Submit
                                            </Button>
                                            {errorState.length !== 0 && (
                                                <Message negative>
                                                    <MessageHeader>Error</MessageHeader>
                                                    <p>{errorState}</p>
                                                </Message>
                                            )}
                                        </Segment>
                                    </Form>
                                </>
                            )}
                        </Grid.Column>
                    </Grid>
                </Container>
            </Grid.Column>
        </Grid>
    );
};

export default Login;
