export interface DocumentDTO {
    DID: number
    name: string
    year: number
    document: string
    comment: string | null
    issuer: string
    language: string
}