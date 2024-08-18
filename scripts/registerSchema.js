import { SchemaRegistry } from '@ethereum-attestation-service/eas-sdk';
import { ethers } from 'ethers';

// Configuration constants
const schemaRegistryContractAddress = '0x1234567890123456789012345678901234567890';
const schemaRegistry = new SchemaRegistry(schemaRegistryContractAddress);

async function registerSchema() {
  try {
    // Initialize the provider and signer
    const provider = new ethers.JsonRpcProvider(process.env.RPC_ENDPOINT);
    const signer = new ethers.Wallet(process.env.EAS_PRIVATE_KEY, provider);
    schemaRegistry.connect(signer);

    // Initialize SchemaEncoder with the schema string
    const schema = "";
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