class User {
    _id: string;
    displayname: string;
    username: string;
    password: string;
    firstname: string;
    lastname: string;
    tel: string;
    mail: string;
    image: string; //!-- mean image url.
    role: UserRole;
    department: string;
    jobLevel: JobLevel;
    jobPosition: string;
    status: string;
    roomAccess: RoomAccessData[];
    memberOfRooms: string[];
    lastEditProfile: Date;
    favoriteUsers: string[]; // user_id
    favoriteGroups: string[]; // room_id
}