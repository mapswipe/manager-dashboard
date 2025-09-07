import SmartLink from '#base/components/SmartLink';
import PageLayout from '#components/PageLayout';

import ManagerList from './ManagerList';
import OrganizationList from './OrganizationList';

function Home() {
    return (
        <PageLayout
            // className={className}
            heading="Manager Dashboard"
            headerDescription={(
                <div>
                    You can set up a new project by setting up project draft through
                    &nbsp;
                    <SmartLink
                        route="newProject"
                        spacing="none"
                    >
                        New Project
                    </SmartLink>
                    &nbsp;
                    page.
                </div>
            )}
        >
            <OrganizationList />
            <ManagerList />
        </PageLayout>
    );
}

export default Home;
