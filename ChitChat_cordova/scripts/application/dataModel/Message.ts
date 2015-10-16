class MessageMeta {
    duration: string;
    thumbnail:string;
    name: string;
    mimeType: string;
    size: string;
}

class Message {
    _id: string;
    rid: string;
    type: ContentType;
    body: string;
    sender: string;
    duration: string;
    resolution:string;
    createTime: Date;
    readers: string[];
    meta: MessageMeta;
}