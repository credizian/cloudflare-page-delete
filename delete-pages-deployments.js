// delete-pages-deployments.js
import 'dotenv/config';
import fetch from 'node-fetch';

// Load environment variables or use defaults
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const PROJECT_NAME = process.env.CLOUDFLARE_PROJECT_NAME || 'example-project';

// Validate required environment variables
if (!CLOUDFLARE_API_TOKEN) {
  console.error('Error: CLOUDFLARE_API_TOKEN environment variable is required');
  process.exit(1);
}

if (!ACCOUNT_ID) {
  console.error('Error: CLOUDFLARE_ACCOUNT_ID environment variable is required');
  process.exit(1);
}

async function listPagesProjects() {
  try {
    const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.errors?.[0]?.message || `HTTP error! status: ${res.status}`);
    }
    return data.result;
  } catch (error) {
    console.error('Error listing Pages projects:', error.message);
    return null;
  }
}

async function getDeployments(page = 1) {
  try {
    let url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}/deployments?page=${page}&per_page=25`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      console.error('Cloudflare API error response:', JSON.stringify(data, null, 2));
      throw new Error(data.errors?.[0]?.message || `HTTP error! status: ${res.status}`);
    }

    return data;
  } catch (error) {
    console.error(`Error fetching deployments (page: ${page}):`, error.message);
    return null;
  }
}

async function deleteDeployment(deploymentId) {
  try {
    const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}/deployments/${deploymentId}?force=true`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(`HTTP error! status: ${res.status}, message: ${errorData.errors?.[0]?.message || 'Unknown error'}`);
    }

    return true;
  } catch (error) {
    console.error(`Error deleting deployment ${deploymentId}:`, error.message);
    return false;
  }
}

async function main() {
  // List all Pages projects first
  const projects = await listPagesProjects();
  if (projects) {
    console.log('\nYour Cloudflare Pages projects:');
    projects.forEach((proj, idx) => {
      console.log(`${idx + 1}. ${proj.name} (id: ${proj.id})`);
    });
  } else {
    console.log('Could not list Pages projects. Please check your credentials.');
  }

  console.log(`Starting deletion of deployments for project: ${PROJECT_NAME}`);
  console.log(`Account ID: ${ACCOUNT_ID}`);

  let page = 1;
  let totalDeleted = 0;
  let totalProcessed = 0;
  let totalPages = null;

  try {
    while (true) {
      console.log(`\n=== Page ${page} ===`);
      const data = await getDeployments(page);
      if (!data || !data.result || data.result.length === 0) {
        console.log('No more deployments found.');
        break;
      }
      const deployments = data.result;
      if (data.result_info) {
        totalPages = data.result_info.total_pages;
        console.log(`Pagination info:`, data.result_info);
      }
      console.log(`Found ${deployments.length} deployments on this page.`);
      for (const deployment of deployments) {
        totalProcessed++;
        console.log(`Processing deployment ${totalProcessed}: ${deployment.id} (${deployment.environment || 'unknown'})`);
        const success = await deleteDeployment(deployment.id);
        if (success) {
          totalDeleted++;
          console.log(`✓ Deleted deployment: ${deployment.id}`);
        } else {
          console.log(`✗ Failed to delete deployment: ${deployment.id}`);
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      if (totalPages && page >= totalPages) {
        console.log('No more pages available.');
        break;
      }
      page++;
    }
    console.log(`\n=== Summary ===`);
    console.log(`Total pages processed: ${page - 1}`);
    console.log(`Total deployments processed: ${totalProcessed}`);
    console.log(`Total deployments deleted: ${totalDeleted}`);
    console.log(`Failed deletions: ${totalProcessed - totalDeleted}`);
  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});