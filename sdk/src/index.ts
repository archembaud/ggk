import axios, { AxiosInstance } from 'axios';

export interface UserRule {
    userID: string;
    allowedEndpoints: {
        path: string;
        methods: string;
    }[];
}

export interface Rule {
    ruleId: string;
    ruleAPI: string;
    userRules: UserRule[];
    ruleEnabled: boolean;
    dateCreated: number;
    dateModified: number;
}

export interface CreateRuleRequest {
    ruleAPI: string;
    userRules: UserRule[];
}

export interface UpdateRuleRequest {
    ruleAPI?: string;
    userRules?: UserRule[];
    ruleEnabled?: boolean;
}

export interface IsAllowedRequest {
    userID: string;
    url: string;
    method: string;
}

export class GGKClient {
    private client: AxiosInstance;
    private apiKey: string | null;

    constructor(apiKey: string | null) {
        const baseURL = process.env.GGK_URL;
        if (!baseURL) {
            throw new Error('GGK_URL environment variable is not set');
        }
        this.apiKey = apiKey;
        this.client = axios.create({
            baseURL,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': apiKey
            }
        });
    }

    /**
     * Create a new rule
     * @param request The rule creation request
     * @returns The created rule ID
     */
    async createRule(request: CreateRuleRequest): Promise<{ ruleId: string }> {
        const response = await this.client.post('/rules', request);
        return response.data;
    }

    /**
     * Get all rules for the current API key
     * @returns Array of rules
     */
    async getRules(): Promise<{ rules: Rule[] }> {
        const response = await this.client.get('/rules');
        return response.data;
    }

    /**
     * Get a specific rule by ID
     * @param ruleId The ID of the rule to retrieve
     * @returns The requested rule
     */
    async getRule(ruleId: string): Promise<{ rule: Rule }> {
        const response = await this.client.get(`/rules/${ruleId}`);
        return response.data;
    }

    /**
     * Update a specific rule
     * @param ruleId The ID of the rule to update
     * @param request The update request
     * @returns Success message and rule ID
     */
    async updateRule(ruleId: string, request: UpdateRuleRequest): Promise<{ message: string; ruleId: string }> {
        const response = await this.client.put(`/rules/${ruleId}`, request);
        return response.data;
    }

    /**
     * Delete a specific rule
     * @param ruleId The ID of the rule to delete
     * @returns Success message and rule ID
     */
    async deleteRule(ruleId: string): Promise<{ message: string; ruleId: string }> {
        const response = await this.client.delete(`/rules/${ruleId}`);
        return response.data;
    }

    /**
     * Check if a user is allowed to access a specific endpoint
     * @param ruleId The ID of the rule to check
     * @param request The access check request
     * @returns Access allowed/denied response
     */
    async isAllowed(ruleId: string, request: IsAllowedRequest): Promise<{ 
        message: string;
        ruleId: string;
        userID: string;
        url: string;
        host: string;
        path: string;
        method: string;
        accessVia?: 'wildcard';
    }> {
        const response = await this.client.post(`/rules/${ruleId}/isAllowed`, request);
        return response.data;
    }
} 