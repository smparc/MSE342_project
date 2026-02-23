import Avatar from '@mui/material/Avatar';
import {Grid} from '@mui/material'

const AvatarDisplay = ({ name }) => {
    function stringToColor(string) {
        let hash = 0;
        let i;

        /* eslint-disable no-bitwise */
        for (i = 0; i < string.length; i += 1) {
            hash = string.charCodeAt(i) + ((hash << 5) - hash);
        }

        let color = '#';

        for (i = 0; i < 3; i += 1) {
            const value = (hash >> (i * 8)) & 0xff;
            color += `00${value.toString(16)}`.slice(-2);
        }
        /* eslint-enable no-bitwise */

        return color;
    }

    function stringAvatar(name) {
        return {
            sx: {
                bgcolor: stringToColor(name),
            },
            children: `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`,
        };
    }

    return (
        // used AI to find to out that MUI Avatar has its own size and needs to be changed within this component (only changing size of parent component didnt work)
        <Avatar {...stringAvatar(name)} sx={{width: '100%', height: '100%'}} />
    );
}

export default AvatarDisplay;
