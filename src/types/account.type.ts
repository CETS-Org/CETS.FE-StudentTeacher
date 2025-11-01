export interface Account {
    accountId: string;
    email: string | null;
    phoneNumber: string | null;
    fullName: string ;
    dateOfBirth: string;
    cid: string | null;
    address: string | null;
    avatarUrl: string | null;
    password: string | null;
    accountStatusID: string | null;
    isVerified: boolean;
    verifiedCode: string | null;
    verifiedCodeExpiresAt: string | null;
    createdAt: string;
    updatedAt: string | null;
    updatedBy: string | null;
    isDeleted: boolean;
    statusName: string | null;
    roleNames: string[] ;
  }

  export interface Role {
    id: string;
    roleName: string;
  }