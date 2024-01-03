<script>
    export let data;
    export let form;
</script>

<h1>Bypass Paywall</h1>
<form method="POST">
    <label>
        Insert link:
        <input
            type="url"
            placeholder="https://ieeexplore.ieee.org/..."
            name="link"
            autocomplete="off"
            required
        />
    </label>
    <button type="submit">Submit</button>
</form>

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
                <td> <a href={job.link} target="_blank">{job.link}</a> </td>
                {#if job.status === data.jobStatus.SUCCESS}
                    <td> <a href='/files/{job.job_id}' target="_blank">DOWNLOAD</a> </td>
                {:else if job.status === data.jobStatus.FAILED}
                    <td>FAILED</td>
                {:else if job.status === data.jobStatus.IN_PROGRESS}
                    <td>IN_PROGRESS</td>
                {/if}
            </tr>
        {/each}
    </tbody>
</table>
