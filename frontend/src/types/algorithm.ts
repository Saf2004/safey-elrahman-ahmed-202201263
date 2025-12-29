export interface Algorithm {
    id: string;
    name: string;
    description: string;
    requires_model: boolean;
    compatible_environments: string[];
    parameters: Record<string, any>;
}
