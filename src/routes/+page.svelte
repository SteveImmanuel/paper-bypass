<script>
  import { onMount, onDestroy } from 'svelte';

  export let data;
  let fullJobs;
  let jobs = [];
  let keyword = '';
  let intervalId;

  const getDisplayName = (path) => {
    const title = path.split('/').pop().split('.').slice(0, -1).join('.');
    // return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
    return title;
  };

  const getAllJobs = async () => {
    console.log('get all jobs');
    const res = await fetch('/files');
    const response = await res.json();
    fullJobs = response.data;
    filterJobs();
  };

  const filterJobs = () => {
    console.log(fullJobs);
    const filteredJobs = fullJobs.filter((job) => {
      const jobLink = job.link.toLowerCase();
      const jobPath = job.path?.toLowerCase();
      return job.link.includes(keyword) || job.path?.includes(keyword) || jobLink.includes(keyword) || jobPath?.includes(keyword);
    });
    jobs = filteredJobs;
  };

  async function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const response = await fetch('/', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      console.error('Form submission failed:', response.statusText);
      return;
    }

    await getAllJobs();
    event.target.reset();
  }

  onMount(() => {
    getAllJobs();
    intervalId = setInterval(getAllJobs, 3000);
  });

  onDestroy(() => {
    clearInterval(intervalId);
  });
</script>

<form method='POST' class='form-container' on:submit={handleSubmit}>
  <input
    type='url'
    placeholder='Insert link here, e.g., https://ieeexplore.ieee.org/...'
    name='link'
    autocomplete='off'
    required
  />
  <button type='submit'>Submit</button>
</form>

<div class='search-container'>
  <input
    type='url'
    placeholder='Search by title or link here'
    name='link'
    autocomplete='off'
    on:input={(e) => {
      keyword = e.target.value;
      filterJobs();
    }}
    required
  />
</div>

<div class='scrollable-table'>
  {#if jobs?.length > 0}
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Title / Link</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {#each jobs as job (job.job_id)}
          <tr>
            <td>{job.job_id}</td>
            <td>
              {#if job.path}
                <a href={job.link} target='_blank'>{getDisplayName(job.path)}</a
                >
              {:else}
                <a href={job.link} target='_blank'>{job.link}</a>
              {/if}
            </td>
            {#if job.status === data.jobStatus.SUCCESS}
              <td>
                <a class='success' href='/files/{job.job_id}' target='_blank'>DOWNLOAD</a
                >
              </td>
            {:else if job.status === data.jobStatus.FAILED}
              <td class='failed'>FAILED</td>
            {:else if job.status === data.jobStatus.IN_PROGRESS}
              <td>IN PROGRESS</td>
            {/if}
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    <p>No items found</p>
  {/if}
</div>

<style>
  .scrollable-table {
    max-height: 50vh;
    min-height: 30vh;
    overflow-y: auto;
    width: 100%;
    text-align: center;
  }

  .success {
    color: green;
  }

  .failed {
    color: red;
  }

  table {
    border-collapse: collapse;
    width: 100%;
  }

  thead th {
    position: sticky;
    top: 0;
    background: #ececec; /* To prevent content underneath from showing through */
  }

  th,
  td {
    padding: 8px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }

  tr:hover {
    background-color: #f5f5f5;
  }

  input {
    font-size: 1em;
    width: 40em;
  }

  button {
    font-size: 1em;
  }

  .form-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 20px;
  }

  .search-container {
    margin-top: 20px;
  }
</style>
