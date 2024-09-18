import axios from 'axios';
import { useState } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { Card, TextField, Heading, Flex, Text, Box, Link, Button, Callout, Inset } from '@radix-ui/themes';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import { Link as RouterLink } from 'react-router-dom';



export function CreateAccountCard() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [error, setError] = useState(null);

    const navigate = useNavigate();  // Initialize useNavigate for redirection

    const handleCreateAccount = async (event: any) => {
        event.preventDefault();
        setError(null);
        try {
            const response = await axios.post(
                'http://127.0.0.1:8000/api/v1/register/',
                { username: username, password: password, password2: password2, email: email, first_name: firstName, last_name: lastName }
            );

            Cookies.set('token', response.data.token);

            navigate('/login');

        } catch (error: any) {
            if (error.response) {
                var data = ''
                for (let key in error.response.data) {
                    data += key + ': ' + error.response.data[key] + '\n';
                }
                setError(data || 'Something went wrong!');
            } else {
                console.log(error);
                setError(error.message);
            }
        }
    };

    return (
        <div className="main-page font-work-sans w-screen h-screen flex overflow-hidden">
            <div className="w-full h-full flex justify-center items-center align-middle">
                <Card size="4" style={{ width: 400 }}>
                    {/* <Inset clip="padding-box" side="top" pb="current">
                        <img
                            src="bs.png"
                            alt="Bold typography"
                            style={{
                                display: 'block',
                                objectFit: 'cover',
                                width: '100%',
                                height: 140,
                                backgroundColor: 'var(--gray-5)',
                            }}
                        />
                    </Inset> */}
                    <div className='flex justify-between'>
                        <Heading as="h3" size="6" trim="start" mb="5">
                            Create Account
                        </Heading>
                        <div>

                        </div>
                    </div>

                    <Box mb="5">
                        <label>
                            <Text as="div" size="2" weight="medium" mb="1">
                                Username
                            </Text>
                            <TextField.Root placeholder="Enter your username" onChange={(e) => setUsername(e.target.value)} />
                        </label>
                    </Box>

                    <Box mb="5" position="relative">
                        <Flex align="baseline" justify="between" mb="1">
                            <Text as="label" size="2" weight="medium" htmlFor="card-password-field">
                                Password
                            </Text>
                        </Flex>
                        <TextField.Root
                            id="card-password-field"
                            placeholder="Enter your password"
                            type='password'
                            onChange={(event) => setPassword(event.target.value)}
                        />
                    </Box>

                    <Box mb="5" position="relative">
                        <Flex align="baseline" justify="between" mb="1">
                            <Text as="label" size="2" weight="medium" htmlFor="card-password-field">
                                Password Again
                            </Text>
                        </Flex>
                        <TextField.Root
                            id="card-password-field"
                            placeholder="Enter your password"
                            type='password'
                            onChange={(event) => setPassword2(event.target.value)}
                        />
                    </Box>

                    <Box mb="5" position="relative">
                        <Flex align="baseline" justify="between" mb="1">
                            <Text as="label" size="2" weight="medium" htmlFor="card-password-field">
                                Email
                            </Text>
                        </Flex>
                        <TextField.Root
                            id="card-password-field"
                            placeholder="Enter your email"
                            onChange={(event) => setEmail(event.target.value)}
                        />
                    </Box>

                    <Box mb="5" position="relative">
                        <Flex align="baseline" justify="between" mb="1">
                            <Text as="label" size="2" weight="medium" htmlFor="card-first-name-field">
                                First Name
                            </Text>
                        </Flex>
                        <TextField.Root
                            id="card-first-name-field"
                            placeholder="Enter your first name"
                            onChange={(event) => setFirstName(event.target.value)}
                        />
                    </Box>

                    <Box mb="5" position="relative">
                        <Flex align="baseline" justify="between" mb="1">
                            <Text as="label" size="2" weight="medium" htmlFor="card-last-name-field">
                                Last Name
                            </Text>
                        </Flex>
                        <TextField.Root
                            id="card-last-name-field"
                            placeholder="Enter your last name"
                            onChange={(event) => setLastName(event.target.value)}
                        />
                    </Box>

                    <Flex mt="6" justify="between" gap="3">
                        <Button variant="soft">
                            <RouterLink to="/login">Back</RouterLink>
                        </Button>
                        <Button onClick={handleCreateAccount}>Create an account</Button>
                    </Flex>

                    {
                        error &&
                        <Callout.Root color='red' className='mt-4'>
                            <Callout.Icon>
                                <InfoCircledIcon />
                            </Callout.Icon>
                            <Callout.Text>
                                {error}
                            </Callout.Text>
                        </Callout.Root>
                    }
                </Card>
            </div >
        </div >
    );
};
