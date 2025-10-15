import { Region } from "react-native-maps";

export type AuthUserType = {
  uid: string | undefined | null; // uid
  name: string | undefined | null; //display name
  email: string | undefined | null; // email
  image?: string | undefined; //photoURL
  phoneNumber?: string | undefined | null; //phonenumber
  createdAt?: number;
  role?: string | undefined | null; // role
  primaryId?: string | undefined | null; // primaryId
  bio?: string;
  locationDetails?: {
    location: LocationType;
    address: AddressType;
  } | null;
  providers?: string[];
  expoTokens?: string;
};

export type LocationType = {
  latitude: number;
  longitude: number;
};

export type AddressType = {
  formattedAddress: string;
  city: string;
  country: string;
  region: string;
  postalCode: string;
};

export type MessageType = {
  id?: string;
  message: string;
  timeStamp: string;
  senderId: string;
  senderName: string;
  receiverId: string | null;
  imageUrl?: string | null;
  read?: boolean; // true if read, false if not
  attachments?:AttchmentsAndDocumentsContainerChildType[]; // attachments is used for images
  documentsContainer?:AttchmentsAndDocumentsContainerChildType[];  // used for documents


};

export type AttchmentsAndDocumentsContainerChildType = {
  fileName:string;
  uri:string;
  fileType:string;
}


export type UserReducerInitStateType = {
  user: AuthUserType | null;
};

export type UserLocationRedInitalStateType = {
  location: LocationType | null;
  address: AddressType | null;
};

export type AllUserListRedInitStateType = {
  users: AuthUserType[] | null;
};

export type UserCredRedInitStateType = {
  otpCode: string | null;
  verificationID: string | null;
};

export type SelectedGpMemberType = {
  image: string;
  uid: string;
};

export type selectedGroupMembersRedInitStateType = {
  selectedMembers: AuthUserType[] | [];
};

export type GroupSearchQueryRedInitState = {
  searchedQuery: string | "";
  selectedMember: number | 0;
};

export type GroupType = {
  id?:string;
  name: string;
  image: string | null;
  createdAt: number;
  createdBy: string;
  members: boolean[] | null; // UIDs of group members
  membersDetails: GroupMember[] | null;
  messages?: GroupMessageType[] | null;
  metadata?: GroupMetaDataType | null;
};

export type GroupMessageType = {
  id?:string; // messageId
  senderId: string; // UID of the sender
  senderName: string; // displayName (or “System”)
  message: string; // text content (or URL if you extend to images/files)
  timeStamp: number; // Unix epoch ms
  type?: "text" | "image" | "file" | "system";
  attachments?:AttchmentsAndDocumentsContainerChildType[]; // attachments is used for images
  documentsContainer?:AttchmentsAndDocumentsContainerChildType[];  // used for documents

};

export interface GroupMember {
  uid: string;
  name: string;
  image?: string;
}

export type GroupMetaDataType = {
  lastMessage: string;
  lastMessageSenderId: string;
  lastMessageTime: number;
};


export interface DataItem {
  id: number;
  name: string;
}


export interface ImagesAndDocumentsContainerInterface {
uri:string;
id:string;
name:string;
fileType:string
}

// FILES TYPES
//video/mp4
//application/pdf
//image/jpeg

export type  GroupSelectedMemberInitType={
members:AuthUserType[] | null
  
}
