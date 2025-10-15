// useGroupMessages.ts
import { useEffect, useState, useRef, useCallback } from "react";
import {
  getDatabase,
  ref,
  query,
  orderByChild,
  limitToLast,
  endAt as endAtQuery,
  onChildAdded,
} from "@react-native-firebase/database";
import { GroupMessageType } from "@/utils/types";


export function useGroupMessages(
  groupId: string,
  pageSize = 50
): {
  messages: GroupMessageType[];
  loadMore: () => void;
  isLoadingMore: boolean;
} {
  const db = getDatabase();
  const [messages, setMessages] = useState<GroupMessageType[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // track oldest timestamp loaded
  const oldestTs = useRef<number | null>(null);
  // store our unsubscribe functions
  const unsubs = useRef<(() => void)[]>([]);

  const subscribePage = useCallback(
    (beforeTs: number | null) => {
      let q = query(
        ref(db, `groups/${groupId}/messages`),
        orderByChild("timeStamp"),
        limitToLast(pageSize)
      );

      if (beforeTs !== null) {
        q = query(
          ref(db, `groups/${groupId}/messages`),
          orderByChild("timeStamp"),
          endAtQuery(beforeTs - 1),
          limitToLast(pageSize)
        );
      }

      // Use the unsubscribe function returned by onChildAdded
      const unsubscribe = onChildAdded(q, (snap) => {
        const data = snap.val();
        if (!data) return;
        const msg: GroupMessageType = {
          id: snap.key!,
          message: data.message,
          senderId: data.senderId,
          senderName: data.senderName,
          timeStamp: data.timeStamp,
          type: data.type,
        };

        setMessages((cur) => {
          if (cur.some((m) => m.id === msg.id)) return cur;
          return [...cur, msg].sort((a, b) => a.timeStamp - b.timeStamp);
        });

        oldestTs.current =
          oldestTs.current === null
            ? msg.timeStamp
            : Math.min(oldestTs.current, msg.timeStamp);
      });

      // Store the unsubscribe function for cleanup
      unsubs.current.push(unsubscribe);
    },
    [db, groupId, pageSize]
  );

  // initial load & cleanup on groupId change
  useEffect(() => {      
    if (!groupId) return;
    setMessages([]);
    oldestTs.current = null;
    subscribePage(null);

    return () => {
      unsubs.current.forEach((fn) => fn());
      unsubs.current = [];
    };
  }, [groupId, subscribePage]);

  const loadMore = useCallback(() => {
    if (isLoadingMore || oldestTs.current === null) return;
    setIsLoadingMore(true);
    subscribePage(oldestTs.current);
    setIsLoadingMore(false);
  }, [isLoadingMore, subscribePage]);

  return { messages, loadMore, isLoadingMore };
}
