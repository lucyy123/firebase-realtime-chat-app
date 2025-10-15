import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { getAuth } from "@react-native-firebase/auth";
import { getDatabase, update } from "@react-native-firebase/database";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "@react-native-firebase/storage";
const db = getDatabase();
const currentUserUid = getAuth().currentUser?.uid

export const getConversationId = (loggedUser, buddyUser) => {
  if (!loggedUser?.uid || !buddyUser?.uid) {
    throw new Error("Both users must have a valid uid");
  }

  const normalize = (val) => {
    // try createdAt, then fallback to mergedAt, then 0
    let t = Number(val);
    if (Number.isNaN(t)) {
      t = Number(buddyUser.mergedAt) || 0;
    }
    return t;
  };

  const loggedTime = normalize(loggedUser.createdAt);
  const buddyTime  = normalize(buddyUser.createdAt);

  // now both are numbers (possibly 0) → never NaN
  if (loggedTime <= buddyTime) {
    return `${loggedUser.uid}~${buddyUser.uid}`;
  } else {
    return `${buddyUser.uid}~${loggedUser.uid}`;
  }
};

export function formatTimestampTo12Hour(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
}
//lastMessage: {"receiverId": "qK3W0Rs9zKb1rrTVpaTmq0bZN7y2", "senderId": "zpKJ0t2SQcaMxfYiKcv6CpeAcUu1", "text": "Hmm", "timeStamp": 1743157596862}

export const mergeAccounts = async (emailCredential, phoneCredential) => {
  try {
    const auth = getAuth();
    // Sign in with the email credential.
  } catch (mergeError) {
    console.error("Error merging accounts:", mergeError.message);
  }
};

export  async function uploadImageToFirebase(uri, imageName,path = 'chat_image') {
  console.log('imageName:', imageName)
  try {
    // Get the Firebase Storage instance
    const storage = getStorage();
    // Create a reference for the file path in Firebase Storage
    const storageRef = ref(storage, `${path}/${imageName}`);

    // Use putFile() to upload the file directly from its local URI.
    // Note: putFile() is the native method for file uploads in React Native.
    const snapshot = await storageRef.putFile(uri);
    console.log("Uploaded snapshot:", snapshot);

    // Get the download URL once the upload is complete.
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }
}


export function fixFirebaseUrl(url){
  try {
    const parsed = new URL(url);
    const pathMatch = parsed.pathname.match(/\/o\/(.+)$/);
    if (!pathMatch || pathMatch.length < 2) return url;

    const fullPath = pathMatch[1].split('?')[0]; // "profile_pics/filename.jpg"
    const encodedPath = encodeURIComponent(fullPath); // "profile_pics%2Ffilename.jpg"

    // Reconstruct the full URL with encoded path
    return `${parsed.origin}/v0/b/${parsed.hostname.split('/')[0]}/o/${encodedPath}${parsed.search}`;
  } catch (err) {
    console.error('Invalid Firebase URL:', url);
    return url; // fallback
  }
}

export function safeFirebaseUrl(rawUrl){
  if (!rawUrl) return rawUrl;
  return rawUrl.replace(
    /\/o\/([^?]+)/,
    (_match, objectPath) => `/o/${encodeURIComponent(objectPath)}`
  );
}



export const dummyUsers = [
  {
    id: "user1",
    name: "Amit (Delhi)",
    location: { latitude: 28.6139, longitude: 77.209 }, // New Delhi
    address: "Delhi",
    image: "",
  },
  {
    id: "user2",
    name: "Priya (Mumbai)",
    location: { latitude: 19.076, longitude: 72.8777 }, // Mumbai
    image: "",
    address: "Mumbai",
  },
  {
    id: "user3",
    name: "Raj (Chennai)",
    location: { latitude: 13.0827, longitude: 80.2707 }, // Chennai
    image: "",
    address: "Chennai",
  },
  {
    id: "user4",
    name: "Simran (Kolkata)",
    location: { latitude: 22.5726, longitude: 88.3639 }, // Kolkata
    image: "",
    address: "Kolkata",
  },
  {
    id: "user5",
    name: "Ankit (Hyderabad)",
    location: { latitude: 12.9716, longitude: 77.5946 }, // Bengaluru
    image: "",
    address: "Hyderabad",
  },
  {
    id: "user6",
    name: "Neha (Hyderabad)",
    location: { latitude: 17.385, longitude: 78.4867 }, // Hyderabad
    image: "",
    address: "Hyderabad",
  },
  {
    id: "user7",
    name: "Ravi (Ahmedabad)",
    location: { latitude: 23.0225, longitude: 72.5714 }, // Ahmedabad
    image: "",
    address: "Ahmedabad",
  },
  {
    id: "user8",
    name: "Deepa (Pune)",
    location: { latitude: 18.5204, longitude: 73.8567 }, // Pune
    image: "",
    address: "Pune",
  },
  {
    id: "user9",
    name: "Tarun (Jaipur)",
    location: { latitude: 26.9124, longitude: 75.7873 }, // Jaipur
    image: "",
    address: "Jaipur",
  },
];

export const selectedUser = [];

export const notActualUsers = [
  {
    uid: "user_001",
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    image: "https://picsum.photos/seed/alice/200",
    phoneNumber: "+1-202-555-0143",
    createdAt: 1713984000000, // Apr 25, 2024
    role: "admin",
    primaryId: "A1B2C3",
    bio: "Full-stack dev and coffee enthusiast.",
    locationDetails: {
      location: { latitude: 37.7749, longitude: -122.4194 },
      address: {
        formattedAddress: "1 Market St, San Francisco, CA 94105, USA",
        city: "San Francisco",
        country: "USA",
        region: "California",
        postalCode: "94105",
      },
    },
    providers: ["password", "google.com"],
    expoTokens: "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  },
  {
    uid: "user_002",
    name: "Bhavana Rao",
    email: "bhavana.rao@example.in",
    image: "https://picsum.photos/seed/bhavana/200",
    phoneNumber: "+91-98765-43210",
    createdAt: 1704067200000, // Jan 1, 2024
    role: "user",
    primaryId: "X9Y8Z7",
    bio: "React Native developer based in Bangalore.",
    locationDetails: {
      location: { latitude: 12.9716, longitude: 77.5946 },
      address: {
        formattedAddress: "MG Road, Bangalore, Karnataka 560001, India",
        city: "Bangalore",
        country: "India",
        region: "Karnataka",
        postalCode: "560001",
      },
    },
    providers: ["password"],
    expoTokens: "ExponentPushToken[yyyyyyyyyyyyyyyyyyyyyy]",
  },
  {
    uid: "user_003",
    name: "Carlos Méndez",
    email: "carlos.mendez@example.mx",
    image: "https://picsum.photos/seed/carlos/200",
    phoneNumber: "+52-55-1234-5678",
    createdAt: 1698796800000, // Nov 1, 2023
    role: "moderator",
    primaryId: "M3N2P1",
    bio: "UX designer & part-time photographer.",
    locationDetails: {
      location: { latitude: 19.4326, longitude: -99.1332 },
      address: {
        formattedAddress:
          "Av. Paseo de la Reforma, Mexico City, CDMX 06600, Mexico",
        city: "Mexico City",
        country: "Mexico",
        region: "CDMX",
        postalCode: "06600",
      },
    },
    providers: ["google.com"],
    expoTokens: "ExponentPushToken[zzzzzzzzzzzzzzzzzzzz]",
  },
  {
    uid: "user_004",
    name: "Daria Petrova",
    email: "daria.petrova@example.ru",
    image: "https://picsum.photos/seed/daria/200",
    phoneNumber: "+7-495-123-4567",
    createdAt: 1685577600000, // Jun 1, 2023
    role: "user",
    primaryId: "P4Q5R6",
    bio: "Backend engineer and open-source contributor.",
    locationDetails: {
      location: { latitude: 55.7558, longitude: 37.6173 },
      address: {
        formattedAddress: "Red Square, Moscow, Russia, 109012",
        city: "Moscow",
        country: "Russia",
        region: "Moscow Oblast",
        postalCode: "109012",
      },
    },
    providers: ["password", "facebook.com"],
    expoTokens: "ExponentPushToken[aaaaaaaaaaaaaaaaaaaa]",
  },
  {
    uid: "user_005",
    name: "Emma Smith",
    email: "emma.smith@example.co.uk",
    image: "https://picsum.photos/seed/emma/200",
    phoneNumber: "+44-20-7946-0958",
    createdAt: 1672531200000, // Jan 1, 2023
    role: "guest",
    primaryId: "G7H8I9",
    bio: "Tech writer and blogger.",
    locationDetails: {
      location: { latitude: 51.5074, longitude: -0.1278 },
      address: {
        formattedAddress: "10 Downing St, Westminster, London SW1A 2AA, UK",
        city: "London",
        country: "United Kingdom",
        region: "England",
        postalCode: "SW1A 2AA",
      },
    },
    providers: ["twitter.com"],
    expoTokens: "ExponentPushToken[bbbbbbbbbbbbbbbbbbbb]",
  },
];

export const dummyData = [
  { id: 1, name: "Alice Johnson" },
  { id: 2, name: "Bob Smith" },
  { id: 3, name: "Carlos Mendoza" },
  { id: 4, name: "Diana Patel" },
  { id: 5, name: "Evelyn Zhang" },
  { id: 6, name: "Frank Miller" },
  { id: 7, name: "Grace Kim" },
  { id: 8, name: "Henry Adams" },
  { id: 9, name: "Isla Nguyen" },
  { id: 10, name: "Jack Wilson" },
  { id: 11, name: "Kavita Rao" },
  { id: 12, name: "Liam O’Connor" },
  { id: 13, name: "Maya Singh" },
  { id: 14, name: "Noah Thompson" },
  { id: 15, name: "Olivia Garcia" },
  { id: 16, name: "Paul Anderson" },
  { id: 17, name: "Queenie Lee" },
  { id: 18, name: "Ryan Cooper" },
  { id: 19, name: "Sara Ali" },
  { id: 20, name: "Tommy Brown" },
];

export const updateTheUserExpoPushTokenOnFirebase = async (
  expoToken) => {
  try {
    const userRef = ref(db, `users/${currentUserUid}`);
    const res = await update(userRef, {
      expoTokens: expoToken,
    });
    console.log("Expo Push token update for the user in firebase database");
  } catch (error) {
    console.log(
      "error during updating the expo push token to user firebase database:",
      error
    );
  }
};


export const filesTransferOptions = [

  {
    title:'Gallery',
    iconName:'photo-library',
    Icon:MaterialIcons
  },
  {
    title:'Camera',
    iconName:'photo-camera',
    Icon:MaterialIcons
  },
  {
    title:'Document',
    iconName:'documents',
    Icon:Ionicons
  },
]