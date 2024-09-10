import axios from 'axios';
import { useState } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = 'x-csrftoken'

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const navigate = useNavigate();  // Initialize useNavigate for redirection

    const handleLogin = async (event: any) => {
        event.preventDefault();
        setError(null);
        try {
            const response = await axios.post(
                'http://127.0.0.1:8000/api/v1/login/',
                { username, password }
            );

            let csrfToken = response;
            console.log('CSRF Token:', csrfToken);

            navigate('/');

        } catch (error: any) {
            if (error.response) {
                setError(error.response.data.error || 'Something went wrong!');
            } else {
                console.log(error);
                setError("ERROR!");
            }
        }
    };

    return (
        <div className="w-full h-full flex overflow-hidden">
            <div className="w-full">
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <form onSubmit={handleLogin}>
                    <div>
                        <label>Username:</label>
                        <input type="text" value={username} onChange={e => setUsername(e.target.value)} required />
                    </div>
                    <div>
                        <label>Password:</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit">Login</button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;