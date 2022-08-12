import { User } from 'features/types';
import React from 'react';

type ProfileProps = {
    authUser?: User;
}

export const Profile: React.FC<ProfileProps> = (props): JSX.Element => {
    // const { authUser } = props;

    return (
        <div>Profile Page</div>
    )
}