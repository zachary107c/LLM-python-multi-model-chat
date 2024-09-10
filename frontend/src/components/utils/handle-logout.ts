import axios from 'axios';
import Cookies from 'js-cookie';
axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'x-csrftoken';

export async function handleLogout() {
    try {
        var csrftoken = Cookies.get('csrftoken');
        await axios.post('http://127.0.0.1:8000/api/v1/logout/', {},);
        console.log('Logged out successfully');
    } catch (error) {
        console.error('Logout failed:', error);
    }
};