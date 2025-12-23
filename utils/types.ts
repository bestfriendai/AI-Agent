export interface TranscriptEntry {
    role: "user" | "assistant";
    time_in_call_secs: number;
    message: string;
}

export interface ConversationMetadata {
    start_time_unix_secs: number;
    call_duration_secs: number;
    cost: number;
}

export interface Analysis {
    evaluation_criteria_results: Record<string, string>;
    data_collection_results: Record<string, string>;
    call_successful: "success" | "failure";
    transcript_summary: string;
    call_summary_title: string;
}

export interface ConversationResponse {
    agent_id: string;
    conversation_id: string;
    status: string;
    transcript: TranscriptEntry[];
    metadata: ConversationMetadata;
    has_audio: boolean;
    has_user_audio: boolean;
    has_response_audio: boolean;
    analysis: Analysis;
}

export interface Session {
    id: string; // Firebase IDs are strings
    created_at: string; // ISO string
    user_id: string;
    status: "in-progress" | "done" | "failed";
    conv_id: string;
    tokens?: number;
    call_duration_secs?: number;
    transcript?: string;
    call_summary_title?: string;
}
