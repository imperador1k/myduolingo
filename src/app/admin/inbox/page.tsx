import { getInboxItems } from "@/actions/admin-inbox";
import { InboxClient } from "./inbox-client";

export default async function InboxPage() {
    const items = await getInboxItems();
    
    return <InboxClient initialItems={items} />;
}
