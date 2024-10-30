import React, { useEffect, useState } from 'react';
import { Button, Form, Grid, Header, Message, Segment, Container, MessageHeader, Image } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import { RegisterApi } from '../../api/api';
import { useRef } from 'react';
import { errorData } from './constant';
import { useNavigate } from 'react-router-dom';
import '../../style/Register.css';
import '../../style/DarkTheme.css';

const Register = () => {
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [dob, setDob] = useState('');
    const [errorState, setErrorState] = useState('');
    const [successState, setSuccessState] = useState(false);
    const [apiCall, setApiCall] = useState(false);
    const error = useRef('');
    const navigate = useNavigate();

    function calculateAge(birthDateString) {
        const birthDate = new Date(birthDateString);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    const handleRegister = async () => {
        setErrorState('');
        setSuccessState(false);
        error.current = '';
        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)) {
            error.current = errorData.email;
            setErrorState(errorData.email);
        } else if (!(/^\+\d{5,20}(\.\d+)?$/).test(phoneNumber)) {
            error.current = errorData.phone;
            setErrorState(errorData.phone);
        } else if (dob.length === 0 || calculateAge(dob) < 18) {
            error.current = errorData.dob;
            setErrorState(errorData.dob);
        }
        if (!error.current.length) {
            try {
                setApiCall(true);
                const request = {
                    "fullName": fullName,
                    "phoneNumber": phoneNumber,
                    "dateOfBirth": dob,
                    "email": email
                }
                const response = await RegisterApi(request);
                const responseMessage = await response.json();
                if (!response.ok) {
                    error.current = responseMessage['message'];
                    setErrorState(responseMessage['message']);
                } else {
                    setSuccessState(true);
                }
            } catch (err) {
                error.current = errorData.unknown;
                setErrorState(errorData.unknown);
            } finally {
                setDob('');
                setEmail('');
                setFullName('');
                setPhoneNumber('');
                setApiCall(false);
                setTimeout(() => {
                    setErrorState('');
                    setSuccessState(false);
                    error.current = '';
                }, 4000);
            }
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
                            <Header as='h2' className='subHeader' textAlign='center'>
                                Create Your Account
                            </Header>
                            <Form size='large'>
                                <Segment stacked className='formSegment'>
                                    <Form.Input
                                        fluid
                                        required
                                        icon='user'
                                        iconPosition='left'
                                        placeholder='Full Name'
                                        value={fullName}
                                        onChange={(e) => { setFullName(e.target.value) }}
                                        className='publicKeyInput'
                                    />
                                    <Form.Input
                                        fluid
                                        required
                                        icon='phone'
                                        iconPosition='left'
                                        placeholder='Phone Number without spaces'
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className='publicKeyInput'
                                    />
                                    <Form.Input
                                        fluid
                                        required
                                        type='date'
                                        icon='calendar'
                                        iconPosition='left'
                                        placeholder='Date of Birth'
                                        value={dob}
                                        onChange={(e) => setDob(e.target.value)}
                                        className='publicKeyInput'
                                    />
                                    <Form.Input
                                        fluid
                                        required
                                        icon='envelope square'
                                        type='email'
                                        iconPosition='left'
                                        placeholder='Email'
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className='publicKeyInput'
                                    />

                                    <Button loading={apiCall} fluid size='large' onClick={handleRegister}>
                                        Register
                                    </Button>
                                </Segment>
                            </Form>
                            <Message>
                                <p>Already a registered voter? <a href='/login'>Log In</a></p>
                            </Message>
                            {errorState.length !== 0 ?
                                <Message negative>
                                    <MessageHeader>Error</MessageHeader>
                                    <p>{errorState}</p>
                                </Message>
                                : null
                            }
                            {
                                successState ?
                                    <Message success>
                                        <MessageHeader>Success</MessageHeader>
                                        <p>Registration Successful!!</p>
                                    </Message>
                                    : null
                            }
                        </Grid.Column>
                    </Grid>
                </Container>
            </Grid.Column>
        </Grid>
    );
};

export default Register;
