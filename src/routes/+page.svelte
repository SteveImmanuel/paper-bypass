<script>
    import { enhance } from "$app/forms";

    export let data;
    export let form;
</script>

<form method="POST" use:enhance class="form-container">
    <input
        type="url"
        placeholder="https://ieeexplore.ieee.org/..."
        name="link"
        autocomplete="off"
        required
    />
    <button type="submit">Submit</button>
</form>

{#if data.jobs.length > 0}
    <div class="scrollable-table">
        <table>
            <thead>
                <tr>
                    <th>Id</th>
                    <th>Link</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                {#each data.jobs as job (job.id)}
                    <tr>
                        <td>{job.job_id}</td>
                        <td>
                            <a href={job.link} target="_blank">{job.link}</a>
                        </td>
                        {#if job.status === data.jobStatus.SUCCESS}
                            <td>
                                <a
                                    class="success"
                                    href="/files/{job.job_id}"
                                    target="_blank">DOWNLOAD</a
                                >
                            </td>
                        {:else if job.status === data.jobStatus.FAILED}
                            <td class="failed">FAILED</td>
                        {:else if job.status === data.jobStatus.IN_PROGRESS}
                            <td>IN PROGRESS</td>
                        {/if}
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
{/if}

<style>
    .scrollable-table {
        max-height: 50vh; /* adjust this value to your needs */
        overflow-y: auto;
        width: 100%;
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
</style>
