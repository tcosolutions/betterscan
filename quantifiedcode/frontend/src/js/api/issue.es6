import { render }  from 'react-dom';
import Utils from "utils"

export default {
    getIssuesData(projectId,onSuccess,onError) {
        return Utils.apiRequest({
            type: 'GET',
            url: (projectId ? '/project/'+projectId : '')+ "/issues_data",
            success: onSuccess,
            error: onError
        })
    },

    updateIssueStatus(projectId,issueId,data,onSuccess,onError) {
        return Utils.apiRequest({
            type: 'PUT',
            url: '/project/'+projectId + "/issue/"+issueId+'/status',
            success: onSuccess,
            data: data,
            error: onError
        })
    }
}
