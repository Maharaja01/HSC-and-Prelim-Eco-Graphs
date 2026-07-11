document.addEventListener('DOMContentLoaded', () => {
    // Tab switching (Year 11 vs Year 12)
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => {
                c.classList.remove('active');
                c.style.display = 'none';
            });

            // Add active to clicked
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-tab');
            const targetContent = document.getElementById(targetId);
            targetContent.style.display = 'flex';
            targetContent.classList.add('active');
            
            // Trigger resize/redraw on active tab's canvas elements
            // since they might have been hidden
            window.dispatchEvent(new Event('resize'));
        });
    });

    // Topic switching
    const topicLists = document.querySelectorAll('.topic-list');
    
    topicLists.forEach(list => {
        const items = list.querySelectorAll('li');
        items.forEach(item => {
            item.addEventListener('click', () => {
                // Find parent tab content to scope the switching
                const tabContent = item.closest('.tab-content');
                
                // Remove active from sibling lis
                items.forEach(i => i.classList.remove('active'));
                
                // Add active to clicked
                item.classList.add('active');
                
                // Hide all sections in this tab
                const sections = tabContent.querySelectorAll('.topic-section');
                sections.forEach(s => s.classList.remove('active'));
                
                // Show target section
                const targetTopic = item.getAttribute('data-topic');
                const targetSection = tabContent.querySelector(`#topic-${targetTopic}`);
                if (targetSection) {
                    targetSection.classList.add('active');
                }
            });
        });
    });
});
