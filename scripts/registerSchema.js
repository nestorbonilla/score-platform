import { SchemaRegistry } from '@ethereum-attestation-service/eas-sdk';
import { ethers } from 'ethers';
import * as dotenv from 'dotenv'; 

dotenv.config({ path: '.env.local' }); 

// console.log(process.env); 

// Configuration constants
// ARBITRUM
// const schemaRegistryContractAddress = '0x4200000000000000000000000000000000000020';

// ETHEREUM SEPOLIA SCHEMA REGISTRY
const schemaRegistryContractAddress = '0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0';

const schemaRegistry = new SchemaRegistry(schemaRegistryContractAddress);

async function registerSchema() {
  try {
    // Initialize the provider and signer
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_ENDPOINT);
    const signer = new ethers.Wallet(process.env.EAS_PRIVATE_KEY, provider);
    schemaRegistry.connect(signer);

    // Initialize SchemaEncoder with the schema string
    
    // Google Maps
    const schema = "string name, string physicalAddress, string score, string reviewCount";
    
    // Holonym
    const revocable = true;
    
    const tx = await schemaRegistry.register({
      schema,
      revocable
    });
    
    await tx.wait();
    console.log('Schema registered:', tx);
  } catch (error) {
    console.error('Error registering schema:', error);
  }
};

registerSchema();