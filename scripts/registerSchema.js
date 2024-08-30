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
    const provider = new ethers.JsonRpcProvider(process.env.ENDPOINT_RPC);
    const signer = new ethers.Wallet(process.env.EAS_PRIVATE_KEY, provider);
    schemaRegistry.connect(signer);

    // Initialize SchemaEncoder with the schema string
    
    // Google Maps
    // const schema = process.env.NEXT_PUBLIC_GMAPS_SCHEMA;
    
    // SMS
    // const schema = process.env.NEXT_PUBLIC_SMS_SCHEMA;
    
    // Climate Resilience
    // const schema = process.env.NEXT_PUBLIC_CLIMATE_SCHEMA_ORIGIN; // The origin, not the one used to attest in the platform
    const schema = process.env.NEXT_PUBLIC_CLIMATE_SCHEMA;
    
    // Eco Tech
    // const schema = process.env.NEXT_PUBLIC_ECO_SCHEMA_ORIGIN; // The origin, not the one used to attest in the platform
    // const schema = process.env.NEXT_PUBLIC_ECO_SCHEMA;
    
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