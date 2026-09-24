import MainLayout from "../../components/MainLayout"


function HR() {
  return (
    <MainLayout
      isShowing={false}
      pageName="HR"
      hasAddButton={true}
      linkto={"/users/hr/add"}
    >
    </MainLayout>
  )
}

export default HR